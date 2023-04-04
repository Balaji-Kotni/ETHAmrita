import { Reclaim, generateUuid } from "@reclaimprotocol/reclaim-sdk";
import dotenv from "dotenv";
import axios from "axios";
import Claims from "../models/Claims.js";
import User from "../models/User.js";
import { getRepo, getProfile } from "../utils/github.js";

dotenv.config();
const callbackUrl = process.env.CALLBACK_URL + "/" + "callback/";
console.log(callbackUrl);
const reclaim = new Reclaim(callbackUrl);

export const registerUser = async (req, res) => {
  console.log(req.body);
  const { TelegramID, userName, name, GithubUsername } = req.body;
  if (!TelegramID) {
    return res.status(400).json({ message: "TelegramID is required" });
  }
  if (!userName) {
    return res.status(400).json({ message: "userName is required" });
  }
  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }
  const profile = await getProfile(GithubUsername);
  try {
    const user = await User.findOne({
      TelegramID,
    });
    console.log(user);
    if (!user) {
      const NewUser = new User({
        TelegramID,
        userName,
        name,
        githubProfile: profile,
      });
      await NewUser.save();
      return res.status(200).json({ message: "User registered successfully" });
    }
    return res.status(200).json({ message: "User already registered" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

function isGitHubUrl(url) {
  const gitHubUrlPattern =
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/;
  return gitHubUrlPattern.test(url);
}

export const getRefer = async (req, res) => {
  console.log(req.body);
  const { github_link, telegramID } = req.body;
  if (!github_link) {
    return res.status(400).json({ message: "Please provide a github link" });
  }
  if (!isGitHubUrl(github_link)) {
    return res.status(400).json({ message: "Invalid github link" });
  }
  const uuid = generateUuid();
  const repo = github_link.split("github.com/")[1];
  const [owner, repoName] = repo.split("/");
  const repo_detiles = await getRepo(owner, repoName);
  if (repo_detiles.private == true) {
    return res.status(400).json({
      message: "This repo is private, please provide a public repo",
    });
  }
  const callbackId = "repo-" + uuid;
  const template = (
    await reclaim.connect("Github-contributor", [
      {
        provider: "github-contributor",
        params: {
          repo: repo,
        },
      },
    ])
  ).generateTemplate(callbackId);
  const url = template.url;
  const templateId = template.id;
  console.log(telegramID);
  try {
    const newClaim = new Claims({
      callbackId,
      templateId,
      telegramID,
      repo: repo_detiles,
    });
    await newClaim.save();
    return res.status(200).json({
      url,
      callbackId,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
};

export const callback = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.params.id) {
      res.status(400).send(`400 - Bad Request: callbackId is required`);
      return;
    }
    if (!req.body) {
      res.status(400).send(`400 - Bad Request: body is required`);
      return;
    }
    const reqBody = JSON.parse(Object.keys(req.body)[0]);
    if (!reqBody.claims || !reqBody.claims.length) {
      res.status(400).send(`400 - Bad Request: claims are required`);
      return;
    }
    const callbackId = req.params.id;
    try {
      const claim = await Claims.findOne({
        callbackId,
      });
      if (!claim) {
        res.status(400).send(`400 - Bad Request: claim not found`);
        return;
      }
      await Claims.updateOne(
        {
          callbackId,
        },
        {
          $set: {
            claims: reqBody.claims,
            status: "verified",
          },
        }
      );
      const user = await User.findOne({
        telegramID: claim.telegramID,
      });
      if (!user) {
        res.status(400).send(`400 - Bad Request: user not found`);
        return;
      }
      await User.updateOne(
        {
          telegramID: claim.telegramID,
        },
        {
          $set: {
            points: user.points + claim.repo.watchers_count,
          },
          $push: {
            claims: claim,
          },
        }
      );
      res.send(`
      <div style="background-color: #ff69b4; color: white; width: 100%; height: 100%; display: flex; text-align: center; justify-content: center; align-items: center;">
          <h1 style="font-size: 3rem;">
              <span style="text-shadow: 2px 2px #000000;">🤘</span> Your claim has been verified! <span style="text-shadow: 2px 2px #000000;">🎉</span><br>
              <span style="font-size: 1.5rem;">You can now close this window. Points have also been added to your account! <span style="text-shadow: 2px 2px #000000;">👍</span></span>
          </h1>
      </div>
      `);
    } catch (error) {
      console.log(error);
      res.status(400).send(`400 - Bad Request: ${error}`);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(`400 - Bad Request: ${error}`);
  }
};

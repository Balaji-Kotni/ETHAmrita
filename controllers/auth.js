import { Reclaim, generateUuid } from "@reclaimprotocol/reclaim-sdk";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const callbackUrl = process.env.CALLBACK_URL + "/" + "callback/";
console.log(callbackUrl);
const reclaim = new Reclaim(callbackUrl);

export const registerUser = async (req, res) => {
  const { TelegramID, userName, name } = req.body;
  const uuid = generateUuid();
};

const isValidRepo = repoStr => {
  return repoStr.indexOf("/") > -1 && repoStr.split("/").length === 2;
};

// async function isRepositoryPrivate(owner, repo, accessToken) {
//   try {
//     const response = await axios.get(
//       `https://api.github.com/repos/${owner}/${repo}`,
//       {
//         headers: {
//           Authorization: `token ${process.env.GITHUB_TOKEN}`,
//         },
//       }
//     );
//     console.log(response.data);
//     return response.data.private;
//   } catch (error) {
//     console.error(error);
//   }
// }

function isGitHubUrl(url) {
  const gitHubUrlPattern =
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/;
  return gitHubUrlPattern.test(url);
}

export const getRefer = async (req, res) => {
  const { github_link } = req.body;
  if (!isGitHubUrl(github_link)) {
    return res.status(400).json({ message: "Invalid github link" });
  }
  if (!github_link) {
    return res.status(400).json({ message: "Please provide a github link" });
  }
  const uuid = generateUuid();
  const repo = github_link.split("github.com/")[1];
  if (!isValidRepo(repo)) {
    return res.status(400).json({ message: "Invalid github link" });
  }
  const [owner, repoName] = repo.split("/");
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
  console.log(url, templateId);
  return res.status(200).json({
    url,
    callbackId,
  });
};

export const callback = async (req, res) => {
  console.log(req.body);
  console.log(
    "Callback received",
    req.params.id,
    req.body.callbackId,
    req.body.templateId,
    req.body.data
  );
  if (!req.params.id) {
    res.status(400).send(`400 - Bad Request: callbackId is required`);
    return;
  }

  if (!req.body) {
    res.status(400).send(`400 - Bad Request: body is required`);
    return;
  }

  const reqBody = JSON.parse(decodeURIComponent(req.body));
  console.log(reqBody);
};

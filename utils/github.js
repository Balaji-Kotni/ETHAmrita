import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getRepo = async (owner, repo) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (
      response.data.private == true ||
      response.data.message == "Not Found" ||
      response.status == 404
    ) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async owner => {
  const response = await axios.get(`https://api.github.com/users/${owner}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  return response.data;
};

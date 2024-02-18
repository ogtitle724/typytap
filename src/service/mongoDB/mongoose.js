import mongoose from "mongoose";
import Post from "./model/model_post";

mongoose.connect(process.env.CONN_STRING);

export async function create(data) {
  try {
    const newPost = await Post.create(data);

    await newPost.save();
    return newPost;
  } catch (err) {
    console.error(err.message);
  }
}

export async function read(id) {
  try {
    let post = await Post.findById(id);
    return post;
  } catch (err) {
    console.error(err.message);
  }
}

export async function paging(topic, page, size) {
  try {
    let pagingData;

    if (topic) {
      pagingData = await Post.find({ topic })
        .skip(size * (page - 1))
        .limit(size);
    } else {
      pagingData = await Post.find()
        .sort({ wr_date: -1 })
        .skip(size * (page - 1))
        .limit(size);
    }

    return pagingData;
  } catch (err) {
    console.error(err.message);
  }
}

export async function update(id, data) {
  try {
    let post = await Post.findById(id);

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "object") {
        post[key] = structuredClone(data[key]);
      } else {
        post[key] = data[key];
      }
    });

    await post.save();
    return post;
  } catch (err) {
    console.error(err.message);
  }
}

export async function del(id) {
  try {
    await Post.deleteOne({ _id: id });
  } catch (err) {
    console.error(err.message);
  }
}

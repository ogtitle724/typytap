import Board from "@/app/_components/board/basic/board";
import { getMetadata } from "@/config/metadata";
import { Suspense } from "react";
import BoardSkeleton from "@/app/_components/skeletion/board/board_skeleton";
import { topics } from "@/config/topic";

export const dynamic = "force-static";

export const generateStaticParams = async () => {
  return topics.map((topic) => {
    topic;
  });
};

export const generateMetadata = async ({ params, searchParams }) => {
  try {
    const query = { topic: params.topic, is_public: true };
    const page = searchParams.page;

    const url =
      process.env.NEXT_PUBLIC_URL_PAGING +
      `?page=${page}&query=${JSON.stringify(query)}`;
    const options = {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { tags: ["paging"] },
    };

    const res = await fetch(url, options);
    const pagingData = await res.json();

    let [description, idx] = ["", 1];

    if (pagingData.posts.length) {
      for (const post of pagingData.posts) {
        description += `(${idx})${post.title} `;

        if (description.length > 160) {
          description = description.slice(0, 157) + "...";
          break;
        } else {
          idx++;
        }
      }
    }

    return getMetadata(
      `${params.topic} related posts page ${page}`,
      description,
      process.env.URL + `/post/${params.topic}?page=${page}`
    );
  } catch (err) {
    console.error(
      "ERROR(/topic/[topic]/page.js > generateMetadata):",
      err.message
    );
  }
};

async function Content({ params, searchParams }) {
  const query = { topic: params.topic, is_public: true };
  const page = searchParams.page || 1;

  try {
    const url =
      process.env.NEXT_PUBLIC_URL_PAGING +
      `?page=${page}&query=${JSON.stringify(query)}`;
    const options = {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { tags: ["paging"] },
    };

    const res = await fetch(url, options);
    const pagingData = await res.json();

    return (
      <>
        <h1 className="hide">{`${params.topic} related posts page ${page}`}</h1>
        <Board
          pagingData={pagingData}
          isPagination={true}
          query={JSON.stringify(query)}
        />
      </>
    );
  } catch (err) {
    console.error("ERROR(/topic/[topic]/page.js) > <Content>", err.message);
    return <span>There is an error during fetching Posts</span>;
  }
}

export default async function Topic({ params, searchParams }) {
  return (
    <>
      <Suspense fallback={<BoardSkeleton />}>
        <Content params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

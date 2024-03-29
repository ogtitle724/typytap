import Link from "next/link";
import BtnDelete from "@comps/btn/delete/delete";
import BtnEdit from "@/app/_components/btn/edit/edit";
import CodeBlock from "@/app/_components/code/code";
import { sanitize } from "@/lib/secure";
import { read, relate } from "@/service/mongoDB/mongoose_post";
import { auth } from "@/auth";
import styles from "./postDetail.module.css";

export default async function PostDetail({ params }) {
  try {
    const postData = await read(params.id);

    const regexCode = /(<pre><code.*?>.*?<\/code><\/pre>)/gs;
    const splited = postData.content.split(regexCode);

    const relatePosts = await relate(
      postData.wr_date,
      postData.author.id,
      postData.topic
    );

    let prevPosts = relatePosts.prevPosts;
    let nextPosts = relatePosts.nextPosts.reverse();

    if (prevPosts.length < 3) {
      nextPosts = nextPosts.slice(-(6 - prevPosts.length));
    } else if (nextPosts.length < 3) {
      prevPosts = prevPosts.slice(0, 6 - nextPosts.length);
    } else {
      prevPosts = prevPosts.slice(0, 3);
      nextPosts = nextPosts.slice(-3);
    }

    return (
      <>
        <section className={styles.main}>
          <h1>{postData.title}</h1>
          <div className={styles.dataWrapper}>
            <Metadata
              name={postData.author.name}
              topic={postData.topic}
              date={postData.wr_date}
            />
            <BtnWrapper postData={postData} />
          </div>

          <div className={styles.content}>
            {splited.map((html, idx) => {
              if (html.startsWith("<pre><code")) {
                return <CodeBlock key={"code block" + idx} codeString={html} />;
              } else {
                return (
                  <div
                    key={"content block" + idx}
                    dangerouslySetInnerHTML={{ __html: sanitize(html) }}
                  ></div>
                );
              }
            })}
          </div>
        </section>
        <RelatedPosts
          nextPosts={nextPosts}
          prevPosts={prevPosts}
          title={postData.title}
        />
      </>
    );
  } catch (err) {
    console.error("Error(/app/post/[id]/page.js) :", err.message);
    return (
      <section>
        <span>There is an error during fetching Post</span>
      </section>
    );
  }
}

function Metadata({ name, topic, date }) {
  return (
    <section className={styles.metadata}>
      <span>{` ${name} • ${topic} • ${new Date(date)
        .toString()
        .slice(0, 21)}`}</span>
    </section>
  );
}

async function BtnWrapper({ postData }) {
  const session = await auth();

  return (
    <div className={styles.btns}>
      {session && session.user.uid === postData.author.uid && (
        <>
          <BtnEdit
            isAnnonymous={!postData.author.uid}
            comparePwd={postData.author.pwd}
            targetId={postData._id.toString()}
            size={17}
          />
          <BtnDelete
            isAnnonymous={!postData.author.uid}
            comparePwd={postData.author.pwd}
            url={
              process.env.NEXT_PUBLIC_URL_POST + `/${postData._id.toString()}`
            }
            size={15}
          />
        </>
      )}
    </div>
  );
}

function RelatedPosts({ nextPosts, prevPosts, title }) {
  return (
    <section id="here" className={styles.relatePosts}>
      <h3>Related Posts</h3>
      <ul>
        {nextPosts.map((nextPost, idx) => {
          return (
            <li className={styles.next} key={`next post ${idx}`}>
              <Link href={`/post/${nextPost._id}`}>{nextPost.title}</Link>
            </li>
          );
        })}
        {<li>{title}</li>}
        {prevPosts.map((prevPost, idx) => {
          return (
            <li key={`prev post ${idx}`}>
              <Link href={`/post/${prevPost._id}`}>{prevPost.title}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import styles from "./page.module.css";
import fetchIns from "@/lib/fetch";
import { sanitize } from "@/lib/secure";
import Link from "next/link";
import BtnDelete from "@comps/btn/delete/delete";
import BtnEdit from "@/app/_components/btn/edit/edit";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth_config";

export default async function TopicPage({ params }) {
  const session = await getServerSession(authOptions);

  try {
    const res = await fetchIns.get(
      process.env.NEXT_PUBLIC_URL_POST + `/${params.id}`
    );
    const resData = await res.json();
    const { postData, relatePosts } = resData;
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
    console.log(postData._id);
    return (
      <>
        <section className={styles.post}>
          <div className={styles.data_wrapper}>
            <span>{` ${postData.author.nick || "anonymous"} • ${
              postData.topic
            } • ${new Date(postData.wr_date).toString().slice(0, 21)}`}</span>
          </div>
          <h1>{postData.title}</h1>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: sanitize(postData.content) }}
          ></div>
          <div className={styles.btn_wrapper}>
            {(!postData.author.id ||
              postData.author.id === session?.user.uid) && (
              <>
                <BtnEdit
                  comparePwd={postData.author.pwd}
                  targetId={postData._id}
                  size={20}
                />
                <BtnDelete
                  comparePwd={postData.author.pwd}
                  url={process.env.NEXT_PUBLIC_URL_POST + `/${params.id}`}
                  size={18}
                />
              </>
            )}
          </div>
        </section>
        <section className={styles.related}>
          <h3>Related ARTICLEs</h3>
          <ul>
            {nextPosts.map((nextPost, idx) => {
              return (
                <li
                  className={styles.next}
                  key={`${postData.title}'s next post(${idx})`}
                >
                  <Link href={`/post/${nextPost._id}`}>{nextPost.title}</Link>
                </li>
              );
            })}
            {<li className={styles.related_cur}>{postData.title}</li>}
            {prevPosts.map((prevPost, idx) => {
              return (
                <li
                  className={styles.prev}
                  key={`${postData.title}'s prev post(${idx})`}
                >
                  <Link href={`/post/${prevPost._id}`}>{prevPost.title}</Link>
                </li>
              );
            })}
          </ul>
        </section>
      </>
    );
  } catch (err) {
    console.error(err.message);
  }
}
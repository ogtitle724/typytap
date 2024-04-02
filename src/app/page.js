import Board from "@comps/board/board";
import fetchIns from "@/lib/fetch";
import { getMetadata } from "@/config/metadata";

/* export const generateMetadata = async (props) => {
  const topic = props.params.topic;
  const querys = props.searchParams;

  const pagingData = await getPosts({
    topic: "",
    page: 1,
    select: "_id title summary topic",
    size: 30,
  });

  return;
};
 */

export const metadata = getMetadata();

export default async function Home() {
  try {
    const res = await fetchIns.get(
      process.env.NEXT_PUBLIC_URL_PAGING + `?page=1`
    );
    const pagingData = await res.json();

    return (
      <Board
        pagingData={pagingData}
        type={""}
        isPagination={false}
        query={null}
      />
    );
  } catch (err) {
    console.error(err.message);
    return <span>There is an error during fetching Posts</span>;
  }
}

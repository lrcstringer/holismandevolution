import { getAllChapters } from "@/lib/chapters";
import BookReader from "@/components/book/BookReader";

export default function BookPage() {
  const chapters = getAllChapters();
  return <BookReader chapters={chapters} />;
}

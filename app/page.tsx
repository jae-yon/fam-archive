import { Board } from "@/app/_components/board";
import { Gallery } from "@/app/_components/gallery";
import { Container } from "@/components/common/container";

export default async function Home() {
  return (
    <Container className="flex flex-1 flex-col py-8 gap-8">
      <Gallery />
      <Board />
    </Container>
  );
}

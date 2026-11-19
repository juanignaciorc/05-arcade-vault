import { notFound } from "next/navigation";
import GamePlayer from "@/components/GamePlayer";
import { GAMES, getGame } from "@/lib/games";

// Navigation into this segment may block on `params` (8 light static pages).
export const instant = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function PlayPage({ params }: PageProps<"/games/[id]/play">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}

import { redirect } from 'next/navigation';

export default function PlayGamePage({ params }: { params: { gameId: string } }) {
  redirect(`/?gameId=${params.gameId}`);
}

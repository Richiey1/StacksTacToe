import { redirect } from 'next/navigation';

export default async function PlayGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  redirect(`/?gameId=${gameId}`);
}

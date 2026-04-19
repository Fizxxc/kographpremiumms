import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ChatRoomClient } from "./chat-room-client";

export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="page-section">
      <div className="site-container">
        <ChatRoomClient roomId={params.roomId} />
      </div>
    </div>
  );
}

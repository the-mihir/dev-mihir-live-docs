import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  console.log('Clerk User:', clerkUser);

  if (!clerkUser) {
    console.log('Redirecting to sign-in...');
    redirect('/sign-in');
    return;
  }

  const { id, firstName, lastName, emailAddresses, imageUrl } = clerkUser;

  const user = {
    id,
    info: {
      id,
      name: `${firstName} ${lastName}`,
      email: emailAddresses[0].emailAddress,
      avatar: imageUrl,
      color: getUserColor(id),
    }
  };

  console.log('User Info:', user);

  try {
    const { status, body } = await liveblocks.identifyUser(
      {
        userId: user.info.email,
        groupIds: [],
      },
      { userInfo: user.info }
    );
    console.log('Liveblocks Response:', { status, body });
    return new Response(body, { status });
  } catch (error) {
    console.error('Liveblocks Error:', error);
    return new Response('Error occurred', { status: 500 });
  }
}

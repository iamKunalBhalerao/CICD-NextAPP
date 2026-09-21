import { prisma } from "@repo/db";

export default async function Home() {
  const user = await prisma.user.findFirst();
  
  return (
    <>
      <div className="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center">
        <h1>User's Email {user?.email} and</h1>
        <h1>User's Password {user?.password}</h1>
      </div>
    </>
  );
}

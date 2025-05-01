import { redirect } from "next/navigation";

export default function Home() {
  redirect("/donate");
  return null;
}

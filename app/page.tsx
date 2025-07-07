import Link from "next/link";

export default async function Home() {
  return(
   <div className="bg-white flex justify-center">
<Link href="/auth">صفحه ورود</Link>
<Link href="/dashboard">داشبورد</Link>
   </div>
  )
}
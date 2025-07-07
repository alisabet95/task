import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <section className=" flex justify-around my-28">
        <Link href="/auth">صفحه ورود</Link>
        <Link href="/dashboard">داشبورد</Link>

      </section>
      <section className="max-w-3xl mx-auto text-center py-4 ">
        <p dir="rtl">
          با عرض سلام، راستش من چند بار پیش اومده تو پروژه هام از لاگین/رجیستر استفاده کنم
          واسه همین کدهای یکی از پروژه های قبلیم رو هم براتون گذاشتم. توش از prisma, گوگل
          آتنتیکیشن، formik,Yup استفاده کردم
          به کاربر ایمیل فرستاده میشه و میتونه ثبت نام کنه
          میتونین کدهاش رو ببینین تو gitHub من تو همین پروژه

        </p>
        <Link className="inline-block text-center mx-auto mt-5" href="/my-auth">کار خودم</Link>
      </section>
      <section dir="rtl" className="max-w-3xl mx-auto text-center py-4 ">
        <p>
          درضمن اگر دوست دارین میتونین پروژه های دیگه من رو هم ببینید، متاسفانه کارفرما پروژه عاشا هنوز  روش کار نکرده. واسه همین
          نمیشه کامل فهمید کارایی که کردم رو، یعنی سایت   رو راه ننداخته
        </p>
        <a className="inline-block text-center mx-auto bg-blue-600 mt-5" href="https://todo-album.vercel.app">پروژه ناطور رشت</a><br />
        <a className="inline-block text-center mx-auto mt-5" href="https://usha-store.vercel.app">فروشگاه عاشا</a>
      </section>
    </div>
  )
}

//
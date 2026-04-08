export default function Contact(){
  return (
    <section>
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="text-slate-600 mt-2">We&#39;d love to plan your next shoreline escape. Reach out and a member of our team will respond within one business day.</p>

      <div className="mt-6 card p-6">
        <form action="#" className="flex flex-col gap-3">
          <input className="border p-3 rounded-lg" placeholder="Name" />
          <input className="border p-3 rounded-lg" placeholder="Email" />
          <textarea className="border p-3 rounded-lg" placeholder="Tell us about your plans" rows={4} />
          <button className="bg-amber-400 text-white px-4 py-2 rounded-lg">Send message</button>
        </form>
      </div>
    </section>
  )
}

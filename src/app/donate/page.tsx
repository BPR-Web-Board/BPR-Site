import Navbar from "../components/Navbar";
import DonationForm from "../components/DonationForm";
import Link from "next/link";

export default function DonatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-8 py-6 max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-4">Donate</h1>
        <hr className="border-t border-gray-200 mb-10" />

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <p className="text-lg mb-6 leading-relaxed">
              Thank you for your interest in donating to BPR! You can make a
              tax-deductible{" "}
              <span className="px-1 text-amber-100">donation</span> to the Brown
              Political Review via the Brown Division of Advancement using this{" "}
              <Link
                href="https://bbis.advancement.brown.edu/BBPhenix/give-now?did=a0c2dcfa-343b-4a85-914b-53655258d254"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {" "}
                link
              </Link>
            </p>

            <p className="text-lg mb-6 leading-relaxed">
              If you would like a copy of the BPR print magazine or would like
              to discuss additional ways to support BPR, please email us at
              brown-political-review@brown.edu.
            </p>

            <p className="text-lg mb-6 leading-relaxed">
              We are also always excited to welcome alumni back to campus for
              speaker events, professional development sessions, and coffee
              chats. Please reach out if you are interested!
            </p>
          </div>

          <div className="flex-1">
            <DonationForm />
          </div>
        </div>
      </main>
    </div>
  );
}

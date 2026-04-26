import { redirect } from "next/navigation";

/** Legacy / mistaken URL — send visitors to the home page. Replace with a real page if you add a Sigma feature. */
export default function SigmaRedirectPage() {
    redirect("/");
}

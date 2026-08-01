import Link from "next/link";
import { AuthPanel } from "../../components/auth-panel";

export default function ConnectionPage() {
  return <main className="authPage"><Link className="academyBrand" href="/"><span className="brandGlyph">O</span><span><strong>OncoRT</strong><small>Academy</small></span></Link><AuthPanel /></main>;
}

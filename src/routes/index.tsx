import Editor from "@/components/editor";
import { A, useNavigate } from "@solidjs/router";
import { JSX } from "solid-js";

export default function Page(props: { children: JSX.Element }) {
  const { children } = props;
  const navigate = useNavigate();

  return (
    <div>
      <Editor />
    </div>
  );
}

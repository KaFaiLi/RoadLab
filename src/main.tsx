import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import "./style.css";
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p>教材無法載入。 Content unavailable. 教材を読み込めません。</p>
    ) : (
      this.props.children
    );
  }
}
const root = createRoot(document.getElementById("root")!);
import("./App")
  .then(({ default: App }) =>
    root.render(
      <Boundary>
        <App />
      </Boundary>,
    ),
  )
  .catch(() =>
    root.render(
      <p>教材無法載入。 Content unavailable. 教材を読み込めません。</p>,
    ),
  );

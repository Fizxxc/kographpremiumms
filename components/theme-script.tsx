export default function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem('kp-theme');
        var theme = stored || 'dark';
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

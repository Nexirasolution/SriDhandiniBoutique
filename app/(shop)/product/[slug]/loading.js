// app/product/[slug]/loading.jsx
// Shown instantly on click, so the page never feels frozen while the server renders.
const LINE = '#E7E2D6';
const WASH = '#FBF6E9';

function Bar({ w, h = 14, mt = 0 }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w, height: h, marginTop: mt, background: LINE, borderRadius: 3 }}
    />
  );
}

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-4 sm:pt-16 pb-24" style={{ background: '#fff' }}>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-16">
        <div
          className="w-full h-[38vh] sm:h-auto sm:aspect-[4/5] animate-pulse"
          style={{ background: WASH, borderRadius: 4 }}
        />
        <div>
          <Bar w="30%" h={10} />
          <Bar w="80%" h={28} mt={12} />
          <Bar w="35%" h={24} mt={20} />
          <Bar w="100%" h={1} mt={32} />
          <Bar w="60%" h={36} mt={24} />
          <Bar w="100%" h={44} mt={32} />
        </div>
      </div>
    </div>
  );
}
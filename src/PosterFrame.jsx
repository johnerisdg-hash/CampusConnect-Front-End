// A designated poster frame: fixed shape, so any photo size/ratio fits inside it
// without changing the layout of the content around it.
export default function PosterFrame({ src, alt = '', variant = 'detail' }) {
  return (
    <div className={`poster-frame ${variant}`}>
      <img className="poster-bg" src={src} alt="" aria-hidden="true" />
      <img className="poster-img" src={src} alt={alt} />
    </div>
  );
}

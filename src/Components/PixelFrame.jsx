/**
 * PixelFrame — chunky pixel-art framing primitive.
 *
 * Renders a container with a hard 3px border, a hard offset shadow and
 * optional corner ticks (via CSS). Use it to frame posters, panels and media.
 * `as` lets it render as a different element (e.g. "figure").
 */
export default function PixelFrame({ children, className = "", as: Tag = "div", ...rest }) { // eslint-disable-line no-unused-vars
  return (
    <Tag className={`pixel-frame ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

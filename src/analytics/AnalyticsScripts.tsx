import Script from 'next/script';

/**
 * Injects Meta + Snap pixel bootstrap code only when their IDs are configured via
 * NEXT_PUBLIC_FB_PIXEL_ID / NEXT_PUBLIC_SNAP_PIXEL_ID. Renders nothing otherwise,
 * so the funnel runs with zero analytics setup. Server component (no client JS).
 */
const FB = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const SNAP = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID;

export function AnalyticsScripts() {
  return (
    <>
      {FB ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${FB}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {SNAP ? (
        <Script id="snap-pixel" strategy="afterInteractive">
          {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})
(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init','${SNAP}');snaptr('track','PAGE_VIEW');`}
        </Script>
      ) : null}
    </>
  );
}

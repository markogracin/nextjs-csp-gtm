import Document, {Html, Head, Main, NextScript, DocumentContext} from 'next/document';
import Script from "next/script";
import crypto from "crypto";

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        const nonce = crypto.randomBytes(16).toString('base64');
        return {...initialProps, nonce};
    }

    render() {
        const {nonce} = this.props as any;

        const csp = `
            default-src 'self'; 
            script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://cdn.jsdelivr.net/npm/swiper@10/swiper-element-bundle.min.js;  
            style-src 'self' 'unsafe-inline' 'unsafe-eval';
            img-src 'self' 'unsafe-inline';
        `.replace(/\s{2,}/g, ' ').trim();

        return (
            <Html lang="en">
                <Head>
                    <meta httpEquiv="Content-Security-Policy" content={csp}/>

                    <Script
                        strategy="afterInteractive"
                        id="example-script"
                        nonce={nonce}
                        dangerouslySetInnerHTML={{
                            __html: `console.log('-- local script with nonce is running');`,
                        }}
                    />

                    <Script
                        id="google-tag-manager"
                        strategy="afterInteractive"
                        nonce={nonce}
                    >
                        {`
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                            var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                            j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                            var n=d.querySelector('[nonce]'); 
                            n && j.setAttribute('nonce', n.nonce || n.getAttribute('nonce'));
                            f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','GTM-PTMXKSCZ');
                        `}
                    </Script>
                </Head>
                <body>
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-PTMXKSCZ"
                        height="0"
                        width="0"
                        style={{display: 'none', visibility: 'hidden'}}
                    />
                </noscript>

                <Main/>
                <NextScript nonce={nonce}/>
                </body>
            </Html>
        );
    }
}

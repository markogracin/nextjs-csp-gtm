# NextJS CSP setup with GTM injected scripts 

> This tutorial will guide you how to properly add scripts via GTM, while having CSP protection.

## 1) Install the project
cd into ```npm install``` and ```npm run dev``` to start the project

## 2) Basics
in ```_document.tsx``` we have basic csp rules set like this

```
default-src 'self'; 
script-src 'self' 'unsafe-eval' 'nonce-${nonce}';  
style-src 'self' 'unsafe-inline' 'unsafe-eval';
img-src 'self' 'unsafe-inline';
```
what is enough to block all inline scripts if they don't have a nonce attached to them.
For example, we have a basic inline script that logs some text.

```js
const nonce = crypto.randomBytes(16).toString('base64');

...

<Script
    strategy="afterInteractive"
    id="example-script"
    nonce={nonce}
    dangerouslySetInnerHTML={{
        __html: `console.log('-- local script with nonce is running');`,
    }}
/>
```
if we were to remove the ```nonce``` from the script component, the script would be blocked by CSP rule.

## 3) Inject script via Google Tag Manager
there are 2 common types of script added via GTM such as inline function

...a script with external source:
```js
<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-element-bundle.min.js"></script>
```
...and an inline function: 
```js
<script nonce="{{nonce}}">
  console.log("CSP-allowed script with nonce:", "{{nonce}}");
</script>
```
Each needs a different approach to work, so let's start with the first one which is a bit easier, and for this to work we just need to add to whitelist the script source in our CSP code such like this:
```
default-src 'self'; 
script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://cdn.jsdelivr.net/npm/swiper@10/swiper-element-bundle.min.js;  
style-src 'self' 'unsafe-inline' 'unsafe-eval';
img-src 'self' 'unsafe-inline';
```
The problem starts when we try to add a script containing a custom inline function that needs to be run.
A simple whitelisting won't work here, instead, we have to create a ```variable``` inside the GTM console, and attach it to the script containing the function (also within GTM console)

![gtm-variable](/public/screenshot-gtm-variable.png)
1) we will name this variable ```nonce```
2) element-id has to match the id of our GTM script inside the code:```google-tag-manager```
3) finally, set the ```nonce``` as ```attribute-name``` as set in the preview image.

Now let's add a tag inside GTM console that will contain our function
![gtm-tag](/public/screenshot-gtm-tag.png)
As visible in the screenshot, it's mandatory that the function contains the ```nonce``` attribute for this to work, as now, all scripts that have ```nonce``` attribute and are injected via GTM will be whitelisted by our CSP
```js
<script nonce="{{nonce}}">
  console.log("CSP-allowed script with nonce:", "{{nonce}}");
</script>
```

## 4) Final observation
This setup is all what is needed needed for GTM scripts to load, without the need of ```unsafe-inline``` rule in our ```script-src```




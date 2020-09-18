## Functions

<dl>
<dt><a href="#closeModal">closeModal()</a></dt>
<dd><p>This functions sends to IO App the input to show the activity indicator loader.</p>
</dd>
<dt><a href="#showLoader">showLoader()</a></dt>
<dd><p>This functions sends to IO App the input to show the activity indicator loader.</p>
</dd>
<dt><a href="#hideLoader">hideLoader()</a></dt>
<dd><p>This functions sends to IO App the input to hide the activity indicator loader.</p>
</dd>
<dt><a href="#showSuccess">showSuccess(payload)</a></dt>
<dd><p>A function to show the success component on the IO App side.</p>
</dd>
<dt><a href="#showErrorMessage">showErrorMessage(payload)</a></dt>
<dd><p>A function to send an error message to IO App component</p>
</dd>
<dt><a href="#showAlertBox">showAlertBox(payload)</a></dt>
<dd><p>A function to show an AlertBox in the IO App component.</p>
</dd>
<dt><a href="#checkInjectionCompleted">checkInjectionCompleted()</a></dt>
<dd><p>This is a utility function to check if the injection is yet completed.
This calls onInjectionCompleted function which is implemented by the client and not injected by IO App.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AlertContents">AlertContents</a> : <code>Object</code></dt>
<dd><p>An Object to define the values of Title and description of an alert box.</p>
</dd>
<dt><a href="#MessagePayloadS">MessagePayloadS</a> : <code>Object</code></dt>
<dd><p>An object defined for internationalization purpose.
The key is the language key and the value is the message text</p>
<p>Accepted keys:</p>
<ul>
<li>it</li>
<li>en</li>
</ul>
</dd>
<dt><a href="#MessagePayloadL">MessagePayloadL</a> : <code>Object</code></dt>
<dd><p>An object defined for internationalization purpose.
The key is the language key and the value is the payload for alert box</p>
</dd>
</dl>

<a name="closeModal"></a>

## closeModal()
This functions sends to IO App the input to show the activity indicator loader.

**Kind**: global function  
<a name="showLoader"></a>

## showLoader()
This functions sends to IO App the input to show the activity indicator loader.

**Kind**: global function  
<a name="hideLoader"></a>

## hideLoader()
This functions sends to IO App the input to hide the activity indicator loader.

**Kind**: global function  
<a name="showSuccess"></a>

## showSuccess(payload)
A function to show the success component on the IO App side.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| payload | [<code>MessagePayloadS</code>](#MessagePayloadS) | Will be the message showed in the success screen, otherwise a common text will be displayed |

<a name="showErrorMessage"></a>

## showErrorMessage(payload)
A function to send an error message to IO App component

**Kind**: global function  

| Param | Type |
| --- | --- |
| payload | [<code>MessagePayloadS</code>](#MessagePayloadS) | 

<a name="showAlertBox"></a>

## showAlertBox(payload)
A function to show an AlertBox in the IO App component.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| payload | [<code>MessagePayloadL</code>](#MessagePayloadL) | the value to display in the alert box. |

<a name="checkInjectionCompleted"></a>

## checkInjectionCompleted()
This is a utility function to check if the injection is yet completed.
This calls onInjectionCompleted function which is implemented by the client and not injected by IO App.

**Kind**: global function  
<a name="AlertContents"></a>

## AlertContents : <code>Object</code>
An Object to define the values of Title and description of an alert box.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The title of the alert box. |
| description | <code>string</code> | The main message of the alert box. |

<a name="MessagePayloadS"></a>

## MessagePayloadS : <code>Object</code>
An object defined for internationalization purpose.
The key is the language key and the value is the message text

Accepted keys:
- it
- en

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| it | <code>string</code> | The message defined in Italian. |
| en | <code>string</code> | The message defined in English. |

<a name="MessagePayloadL"></a>

## MessagePayloadL : <code>Object</code>
An object defined for internationalization purpose.
The key is the language key and the value is the payload for alert box

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| it | <code>AlertContent</code> | The values of the alert box in Italian language |
| en | <code>AlertContent</code> | The values of the alert box in English language |


class NxtCREbtn {
    el=document.currentScript;
    btn;
    init=()=>{
        if (!this.el.getAttribute("data-lender-id")) {
            console.warn("Can't find attribute data-lender-id");
            return;
        }
        this.btn = document.createElement("button");
        this.btn.innerHTML = this.el.getAttribute("data-text") || "Payoff Quote";
        this.btn.className="nxtcre-btn";
        this.applyStyles();
        this.el.parentNode.insertBefore(this.btn, this.el.nextSibling);
        this.btn.onclick=this.showModal;
    };
    applyStyles=()=>{
        let styles={
            backgroundColor:"#00b0d3",
            borderWidth:0,
            color:"#fff",
            fontSize: "1.0rem",
            borderRadius: "0.2em",
            padding: "5px 15px"
        };
        try {
            let custom_styles=JSON.parse(this.el.getAttribute("data-style"));
            if (custom_styles) {
                Object.keys(custom_styles)?.forEach(key=>{
                    styles[key]=custom_styles[key];
                });
            }
        } catch (err) {
            console.warn("Attribute data-style contains errors",err);
        }
        Object.keys(styles)?.forEach(key=>{
            this.btn.style[key]=styles[key];
        });
    };
    showModal=()=>{
        let overlay=this.getOverlay();
        this.el.parentNode.insertBefore(overlay, this.el.nextSibling);
        let iframe=this.getContent();
        this.el.parentNode.insertBefore(iframe, this.el.nextSibling);
        let closeicon=document.createElement("span");
        closeicon.style.zIndex=100002;
        closeicon.innerHTML="&#x2715";
        closeicon.style.position="absolute";
        closeicon.style.right="1rem";
        closeicon.style.top="1rem";
        closeicon.style.cursor="default";
        iframe.appendChild(closeicon);
        overlay.onclick=()=> {
            overlay.remove();
            iframe.remove();
        }
        closeicon.onclick=()=>{
            closeicon.remove();
            overlay.remove();
            iframe.remove();
        }
    };
    getOverlay=()=>{
        let overlay=document.createElement("div");
        overlay.style.background="#444";
        overlay.style.opacity=.8;
        overlay.style.position="fixed";
        overlay.style.top="0px";
        overlay.style.left="0px";
        overlay.style.width="100%";
        overlay.style.height="2000px";
        overlay.style.zIndex=100000;
        overlay.className="nxtcre-modal-backdrop";
        return overlay;
    };
    getContent=()=>{
        let div=document.createElement("div");
        let maxWidth=900;
        div.style.width="80%";
        div.style.maxWidth=maxWidth+"px";
        div.style.overflow=""
        div.style.height=window.innerHeight*0.9+"px";
        div.style.borderRadius="1rem";
        if (window.innerWidth*0.8<maxWidth) {
            div.style.left="10%";
        } else
            div.style.left=(window.innerWidth-maxWidth)/2+'px';        
        div.style.position="fixed";
        div.style.top="5%";
        div.style.zIndex=100001;
        div.className="nxtcre-modal";
        let iframe=document.createElement("iframe");
        iframe.width="100%";
        iframe.allowFullscreen=true;
        iframe.allowtransparency = true;
        iframe.style.border="none";
        iframe.style.borderRadius="1rem";
        iframe.height="100%";
        iframe.style.height="100%";
        let url=(this.el.getAttribute("data-url") || "https://q.nxtcre.com") + "/l/"+this.el.getAttribute("data-lender-id")+"?embedded=true";
        if (this.el.getAttribute("data-last_name")) url+="&last_name="+this.el.getAttribute("data-last_name");
        if (this.el.getAttribute("data-first_name")) url+="&first_name="+this.el.getAttribute("data-first_name");
        if (this.el.getAttribute("data-email")) url+="&email="+this.el.getAttribute("data-email");
        if (this.el.getAttribute("data-phone")) url+="&phone="+this.el.getAttribute("data-phone");
        if (this.el.getAttribute("data-organization")) url+="&organization="+this.el.getAttribute("data-organization");
        iframe.src=url;
        div.appendChild(iframe);
        iframe.onload = () =>{
            console.log("height:"+iframe.contentWindow.document.body.scrollHeight);
        }
        return div;
    };
}
let nxtCREbtn=new NxtCREbtn();
nxtCREbtn.init();
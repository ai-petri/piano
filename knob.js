class XKnob extends HTMLElement
{
    constructor()
    {
        super();
        this.className = "knob";
        this.offset = + this.getAttribute("offset") | 0;
        this.min = this.getAttribute("min");
        this.max = this.getAttribute("max");
    }

    isDown = false;
    Y = 0;

    set value(n)
    {
        if((this.min && n<this.min)||(this.max && n>this.max)) return;
        this.rotate((360*n)%360 + this.offset);
        this.update(n);
    }
    get value()
    {
       return (this.shadowRoot.querySelector("#rect").transform.baseVal[0].angle - this.offset) / 360;
    }

    update(){}

    rotate(angle)
    {
        this.shadowRoot.querySelector("#rect").setAttributeNS(null,"transform",`rotate(${angle},25,25)`);
    }

    handleMouseDown = e =>
    {
        this.isDown = true;
        this.Y = e.clientY;
    }
    
    handleMouseUp = e =>
    {
        this.isDown = false;
        this.Y = 0;
    }

    handleMouseMove = e =>
    {
        if(this.isDown)
        {
            this.value += (this.Y - e.clientY)/10000;
        }    
    }

    handleContextMenu = e =>
    {
        e.preventDefault();
        if(this.getAttribute("value"))
        {
            this.value = this.getAttribute("value");
        }
        else
        {
            this.value = 0;
        }
        
    }

    connectedCallback()
    {
        let shadow = this.attachShadow({mode:"open"});

        let svg = create("svg", {width: "50px", height: "50px", viewBox: "0 0 50 50"})

        let gradient = create("radialGradient",{id: "gradient"});
        gradient.append(
            create("stop", {offset: "80%", "stop-color": "rgb(230,230,230)"}),
            create("stop", {offset: "100%", "stop-color": "rgb(180,180,180)"})
        );

        let circle = create("circle", {cx:"25", cy:"25", r:"25", fill: "url(#gradient)"});


        let rect = create("rect", {id:"rect", x:"24", width:"2", height:"10", fill:"rgb(100,100,100)", transform:`rotate(${this.offset},25,25)`});

        svg.append(gradient,circle, rect);
        shadow.appendChild(svg);

        this.addEventListener("wheel", e=>
        {
            if(e.deltaY > 0)
            {
                this.value -= 0.01
            }
            else
            {
                this.value += 0.01;
            }
        })

        this.addEventListener("mousedown", this.handleMouseDown);
        this.addEventListener("contextmenu", this.handleContextMenu);
        addEventListener("mouseup", this.handleMouseUp);
        addEventListener("mousemove", this.handleMouseMove);

        if(this.getAttribute("value"))
        {
            this.value = this.getAttribute("value");
        }


        function create(name, attributes)
        {
            var element = document.createElementNS("http://www.w3.org/2000/svg",name);
            for(var attributeName in attributes)
            {
                element.setAttributeNS(null, attributeName, attributes[attributeName]);
            }
            return element;		
        }

    }
    disconnectedCallback()
    {
        this.removeEventListener("mousedown", this.handleMouseDown);
        this.removeEventListener("contextmenu", this.handleContextMenu);
        removeEventListener("mouseup", this.handleMouseUp);
        removeEventListener("mousemove", this.handleMouseMove);
    }
}

customElements.define("x-knob", XKnob);

class GainKnob extends XKnob
{
    /**
     * 
     * @param {AudioContext} context 
     */
    constructor(context)
    {
        super();
        this.gainNode = context.createGain();
        this.gainNode.gain.value = 0.5;
    }

    /**
     * @param {AudioNode} destination 
     */
    connect(destination)
    {
        this.gainNode.connect(destination)
    }

    update(n)
    {
        this.gainNode.gain.value = 0.5 + n;
    }
}

customElements.define("gain-knob", GainKnob);

class StereoPannerKnob extends XKnob
{
    /**
     * 
     * @param {AudioContext} context 
     */
    constructor(context)
    {
        super();
        this.stereoPannerNode = context.createStereoPanner();
    }

    /**
     * 
     * @param {AudioNode} destination 
     */
    connect(destination)
    {
        this.stereoPannerNode.connect(destination);
    }

    update(n)
    {
        this.stereoPannerNode.pan.value = n;
    }
}

customElements.define("stereo-panner-knob", StereoPannerKnob);

class FilterKnob extends XKnob
{
    /**
     * @param {AudioContext} context
     * @param {BiquadFilterType} type
     * @param {Number} frequency
     */
    constructor(context, type, frequency)
    {
        super();
        this.filterNode = context.createBiquadFilter();
        this.filterNode.type = type;
        this.filterNode.frequency.value = frequency;
        this.filterNode.Q.value = 0.5;
    }

    /** 
     * @param {AudioNode} destination 
     */
    connect(destination)
    {
        this.filterNode.connect(destination);
    }

    update(n)
    {
        this.filterNode.Q.value = n + 0.5;
        this.filterNode.gain.value = 40*n;
    }
}

customElements.define("filter-knob", FilterKnob);
class XKnob extends HTMLElement
{
    constructor()
    {
        super();
    }

    isDown = false;
    Y = 0;

    set value(n)
    {
        this.rotate((360*n)%360);
        this.update(n);
    }
    get value()
    {
       return this.shadowRoot.querySelector("#rect").transform.baseVal[0].angle / 360;
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


        let rect = create("rect", {id:"rect", x:"24", width:"2", height:"10", fill:"rgb(100,100,100)", transform:"rotate(0,25,25)"});

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
        addEventListener("mouseup", this.handleMouseUp);
        addEventListener("mousemove", this.handleMouseMove);


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
        this.gainNode.gain.value = n;
    }
}

customElements.define("gain-knob", GainKnob);
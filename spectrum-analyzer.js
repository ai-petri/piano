class SpectrumAnalyzer extends HTMLElement
{
    /**
     * @param {AudioContext} context 
     */
    constructor(context)
    {
        super();
        this.analyzerNode = context.createAnalyser();
        this.analyzerNode.fftSize = 2048;

    }

    connectedCallback()
    {
        let shadow = this.attachShadow({mode:"open"});
        let canvas = document.createElement("canvas");
        canvas.width = "320";
        canvas.height = "60";
        canvas.style.backgroundColor = "black";
        let ctx = canvas.getContext("2d");
        shadow.appendChild(canvas);

        let data = new Uint8Array(this.analyzerNode.frequencyBinCount);
        let analyzer = this.analyzerNode;

        let step = 12;
        let size = 24;

        function bar(n, h)
        {
            ctx.fillStyle = "grey";
            for(let i=0; i<8; i++)
            {
                ctx.fillStyle = h>i ? "rgb(0,255,0)" : "rgb(40,40,40)";
                ctx.fillRect(10 + 12*n, canvas.height - (20 + 4*i), 10, 2);               
            }
            for(let i=8; i<10; i++)
            {
                ctx.fillStyle = h>i ? "red" : "rgb(20,20,20)";
                ctx.fillRect(10 + 12*n, canvas.height - (20 + 4*i), 10, 2);               
            }

        }

        for(let i=0; i<size; i++)
        {
            ctx.fillStyle = "rgb(0,255,0)";
            let f = Math.round(analyzer.context.sampleRate/analyzer.fftSize*i/100*step)/10;
            if(i%(size/4) == 0 || i == size - 1)
            {
                ctx.fillText(f+" kHz",10+12*i, canvas.height - 5)
            }
        }

        function draw()
        {
            analyzer.getByteFrequencyData(data);
            
            for(let i=0; i<size; i++)
            {
                let value = data.subarray(i*step, (i+1)*step).reduce((a,b)=>a+b, 0)/step;
                bar(i, value/256*10);   
            }

            requestAnimationFrame(draw)
        }

        draw()

    }
}

customElements.define("spectrum-analyzer", SpectrumAnalyzer);
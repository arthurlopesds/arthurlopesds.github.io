// const math = require('mathjs')

// Encontrar as constantes a, b, c, d para montar a função spline
// Sn(x) = an + bn*(x - xn) + cn*(x - xn)^2 + dn*(x - xn)^3
const findSplineConstants = (x, y) => {
    /**
     * x -> valores de x da tabela
     * y -> valores de y da tabela
     */
    var xSize = x.length
    var spline = []
    var a = y
    var b = new Array(xSize).fill(0)
    var c = new Array(xSize).fill(0)
    var d = new Array(xSize).fill(0)
    var alpha = new Array(xSize).fill(0)
    var h = []
    var l = []
    var u = []
    var z = []   
    l.push(1)
    u.push(0)
    z.push(0)
    
    for(let i = 0; i < (xSize - 1); i++) {
        h.push(x[i+1] - x[i])
        if(i > 0) {
            alpha[i] = (3 * (a[i+1] - a[i]) / h[i]) - (3 * (a[i] - a[i-1]) / h[i-1])
            l.push( 2 * (x[i+1] - x[i-1]) - h[i-1] * u[i-1] )
            u.push( h[i] / l[i] )
            z.push( (alpha[i] - h[i-1] * z[i-1]) / l[i] )
        }
    }
    l.push(1)
    z.push(0)

    for(let i = xSize - 2; i >= 0; i--){
        c[i] = z[i] - u[i] * c[i+1]
        b[i] = ((a[i+1] - a[i]) / h[i]) - (h[i] * (c[i+1] + 2 * c[i]) / 3)
        d[i] = (c[i+1] - c[i]) / (3 * h[i])
    }

    for(let i = 0; i < xSize - 1; i++) {
        spline.push({a: a[i], b: b[i], c: c[i], d: d[i]})
    }
    // console.log(spline)
    return spline
}

// Determina os valores de x em cada intervalo
// Ex.: valores desse intervalo [x0, x1]
const getXInterval = x => {
    var interval = ((Math.abs(x[x.length - 1]) - Math.abs(x[0])) * 0.01)
    var valuesInterval = math.range(x[0], x[x.length-1], interval)
    return valuesInterval._data
}


// Sn(x) = an + bn*(x - xn) + cn*(x - xn)^2 + dn*(x - xn)^3
const getYInterpolated = (xn, xInterval, splineConstants) => {
    return splineConstants.a + (splineConstants.b * (xInterval - xn)) 
        + (splineConstants.c * math.pow((xInterval - xn), 2) + splineConstants.d * math.pow((xInterval - xn), 3))
}

const getPolynomialFunction = splineConstants => {
    var polyFunction = []
    for(let i = 0; i < splineConstants.length; i++) {
        polyFunction.push(`S${i}(x) = 
                ${splineConstants[i].a.toFixed(6)} + 
                ${splineConstants[i].b.toFixed(6)}*(x - x${i}) + 
                ${splineConstants[i].c.toFixed(6)}(x - x${i})^2 + 
                ${splineConstants[i].d.toFixed(6)}(x - x${i})^3`)
    }
    return polyFunction
}

const buildSpline = (x, y) => {
    var splineConstants = findSplineConstants(x, y)
    var yInterpolated = []
    var xInterval = getXInterval(x)
    var polynomialFunction = getPolynomialFunction(splineConstants)
    let i = 0

    for(let j = 0; j < xInterval.length; j++) {
        if(xInterval[j] > x[i+1])
            i++
        
        yInterpolated.push(getYInterpolated(x[i], xInterval[j], splineConstants[i]))
    }

    return {x, y, xInterval, yInterpolated, polynomialFunction}
}

// var x = [0.1,
//     0.5,
//     0.9,
//     1.3,
//     1.7]

// var y = [-2.3026,
//     -0.69315,
//     -0.10536,
//     0.26236,
//     0.53063]
// getXInterval(x)
// findSplineConstants(x, y)
// var t = buildSpline(x, y)
// console.log(t)
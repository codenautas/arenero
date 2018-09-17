function cargarEjemplos(){
    funcion.value=sessionStorage.funcion||"";
    casos_de_prueba.value=sessionStorage.casos_de_prueba||'';
}

function cargarEjemplo(cual){
    document.body.removeAttribute('probado');
    funcion.value=cual.funcion;
    casos_de_prueba.value=cual.casos_de_prueba;
    aclaracion.textContent=cual.aclaracion;
    probar();
}

function parsear(texto){
    document.body.removeAttribute('probado');
    var matches = texto.match(/function\s+(\w+)\(([\w,\s]*)\)\{(([\n\r]|.)*)\}[\n\r\s]*$/m);
    return matches;
}

function agregarLinea(destino, linea){
    var elemento = document.createElement('div');
    elemento.textContent = linea;
    destino.appendChild(elemento);
    return elemento;
}

var sandbox={

};

function probar_funcion(datos){
    var parametros = datos.map(function(valor){
        if(valor=='true'){ return true; }
        if(valor=='false'){ return false; }
        if(valor=='null'){ return null; }
        if(valor=='""'){ return ""; }
        if(isNaN(valor)){ return valor; }
        return Number(valor);
    });
    return sandbox.funcion.call(this, parametros);
}

function probar(){
    var texto = funcion.value;
    sandbox.parametros=[];
    parametros.innerHTML="";
    if(!texto.trim()){
        return;
    }
    try{
        sandbox.funcion = null;
        var linea=0;
        sandbox.funcion = new Function('args','var f='+texto.replace(/\r?\n/g,function(que){
            return '/* Linea '+(++linea)+' */ ';
        })+';\n return f.apply(null,args);');
    }catch(err){
        agregarLinea(parametros,'error en la escritura de la función');
        agregarLinea(parametros,err.message);
        console.log(err)
        agregarLinea(parametros,err);
    }
    if(sandbox.funcion){
        var info = parsear(texto);
        if(!info){
            agregarLinea(parametros,'no hay una función')
        }else{
            agregarLinea(parametros,'función '+info[1]);
            var nombres_parametros=info[2].split(',');
            var tabla=document.createElement('table');
            nombres_parametros.forEach(function(nombre,i){
                var fila = tabla.insertRow(-1);
                var celda_nombre = fila.insertCell(-1);
                celda_nombre.textContent = nombre;
                var input = document.createElement('input');
                var celda_input = fila.insertCell(-1);
                celda_input.appendChild(input);
                sandbox.parametros.push(null);
                input.onblur=function(){
                    sandbox.parametros[i] = input.value;
                };
            });
            var boton=document.createElement('button');
            var fila=tabla.insertRow(-1);
            fila.insertCell(-1);
            var celda_boton = fila.insertCell(-1);
            celda_boton.appendChild(boton);
            boton.textContent='correr';
            fila=tabla.insertRow(-1);
            fila.insertCell(-1);
            var celda_resultado = fila.insertCell(-1);
            boton.onclick=function(){
                var resultado = probar_funcion(sandbox.parametros);
                celda_resultado.textContent=resultado;
            };
            parametros.appendChild(tabla);
            var lineas_prueba=casos_de_prueba.value.split(/\r?\n/);
            resultados_prueba.innerHTML="";
            try{
                lineas_prueba.forEach(function(linea){
                    if(linea.trim()){
                        var datos = linea.split(';');
                        var esperado = datos.shift();
                        var obtenido = probar_funcion(datos)+'';
                        var prefijo;
                        if(obtenido == esperado){
                            prefijo = '✅ ';
                        }else{
                            prefijo = '✗ ';
                        }
                        var linea = agregarLinea(resultados_prueba,prefijo+linea);
                        if(obtenido == esperado){
                            linea.style.color='green';
                        }else{
                            linea.style.color='red';
                        }
                        linea.style.fontFamily='courier New'
                    }
                });
                document.body.setAttribute('probado',1);
            }catch(err){
                agregarLinea(parametros,'error en la ejecución de la función');
                agregarLinea(parametros,err.message);
                console.log(err)
                agregarLinea(parametros,err);
            }
        }
    }
}

window.addEventListener('load',function(){
    cargarEjemplos();
    probar();
    boton_probar.addEventListener('click', function(){
        probar();
    });
    resultados_prueba.addEventListener('click',function(){
        document.body.removeAttribute('probado');
    })
    funcion.addEventListener('click',function(){
        document.body.removeAttribute('probado');
    })
    funcion.addEventListener('keydown',function(){
        document.body.removeAttribute('probado');
    })
    funcion.addEventListener('blur', function(){
        sessionStorage.funcion=funcion.value;
    });
    casos_de_prueba.addEventListener('blur', function(){
        sessionStorage.casos_de_prueba=casos_de_prueba.value;
    });
    cargar_e1.onclick=function(){
        cargarEjemplo({
            funcion:"function palindromo(texto){\n    return texto.split('').every(function(letra, posicion){\n        return letra==texto[texto.length-posicion-1];\n    })\n}",
            casos_de_prueba:'true;oso\ntrue;arenera\nfalse;tamaño\n',
            aclaracion:'Un texto es palíndromo si al invertir el orden de las letras que lo componen se obtienen las mismas letras. La función no considera todos los casos posibles, los casos de prueba tampoco.'
        }); 
    };
    cargar_e2.onclick=function(){
        cargarEjemplo({
            funcion:"function isosceles(a,b,c){\n    return (a==b || b==c) && a != c;\n}",
            casos_de_prueba:'true;3;4;4\nfalse;4;4;4\nfalse;3;4;5',
            aclaracion:'La función devuelve true si a, b y c corresponden a las longitudes de los lados de un triángulo isóceles. Un triángulo es isóceles si dos de sus lados tienen la misma longitud y el otro no. La función no considera todos los casos posibles, los casos de prueba tampoco'
        }); 
    };
});
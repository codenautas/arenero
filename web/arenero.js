function cargarEjemplos(){
    funcion.value="function palindromo(texto){\n    return texto.split('').every(function(letra, posicion){\n        return letra==texto[texto.length-posicion-1];\n    })\n}";
    casos_de_prueba.value='true;oso\ntrue;arenera\nfalse;tamaño\n';
}

function parsear(texto){
    var matches = texto.match(/function\s+(\w+)\(([\w,\s]*)\)\{(([\n\r]|.)*)\}[\n\r\s]*$/m);
    return matches;
}

function agregarLinea(destino, linea){
    var elemento = document.createElement('div');
    elemento.textContent = linea;
    destino.appendChild(elemento);
}

var sandbox={

};

function probar(){
    var texto = funcion.value;
    sandbox.parametros=[];
    parametros.innerHTML="";
    try{
        sandbox.funcion = null;
        sandbox.funcion = new Function('args','var f='+texto+';\n return f.apply(null,args);');
    }catch(err){
        agregarLinea(parametros,'error en la escritura de la función');
        agregarLinea(parametros,err.message);
        console.log(err)
        agregarLinea(parametros,err);
    }
    if(sandbox.funcion){
        var info = parsear(texto);
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
            var resultado = sandbox.funcion.call(this, sandbox.parametros);
            celda_resultado.textContent=resultado;
        };
        parametros.appendChild(tabla);
    }
}

window.addEventListener('load',function(){
    cargarEjemplos();
    boton_probar.addEventListener('click', function(){
        probar();
    });
});
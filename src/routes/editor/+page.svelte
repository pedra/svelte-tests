<script type="ts">
	import 'bytemd/dist/index.css'
	import { Editor, Viewer } from 'bytemd'
	import gfm from '@bytemd/plugin-gfm'
  
	let  value = `# Título do Documento

Testando...

1. Um
2. Dois
3. Três
4. Quatro ...



\`\`\`js
let teste = 'Conteúdo da variável de teste!'
console.log('Teste: ', teste)
\`\`\`

> Destaque em Blockote

### Rotina de programação:
- [ ] Programar
- [ ] Testar
- [ ] Voltar

---
*Footer em **bold** e itálico*`
	const plugins = [
		gfm(),
	  // Add more plugins here
	]
  
	function handleChange(e) {
	  value = e.detail.value
	}

	function ver () {
		console.log('Ver: ', value)
	}

	function salvar (e){
		var p = document.querySelector('.markdown-body')
		console.log('Salvar', value)
	}
	
	// <Editor {value} {plugins} on:change={handleChange} /> -->
  </script>
  
  <div>	
	<Editor {value} {plugins} on:change={handleChange} />
	<div class="control">
		<button on:click={ver}>Ver</button>
		<button on:click={salvar}>Salvar</button>
	</div>
  </div>

  <style>
	.control {
		display: flex;
		justify-content: end;
	}
  </style>
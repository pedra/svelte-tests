<script type="ts">
	import 'bytemd/dist/index.css'
	import { Editor, Viewer } from 'bytemd'
	import gfm from '@bytemd/plugin-gfm'
  
	let  value = ''
	const plugins = [
		gfm(),
	  // Add more plugins here
	]
  
	function handleChange(e) {
	  value = e.detail.value
	}

	function salvar (e){
		var p = document.querySelector('.markdown-body')
		console.log('Salvar', p?.innerHTML)
	}
	
	// <Editor {value} {plugins} on:change={handleChange} /> -->
  </script>
  
  <div>	
	<Editor {value} {plugins} on:change={handleChange} />
	<div class="control">
		<button on:click={salvar}>Salvar</button>
	</div>
  </div>

  <style>
	.control {
		display: flex;
		justify-content: end;
	}
  </style>
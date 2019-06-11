import Brain from './brain'
import Layer from './layer'

export default class Gene {
	public inputLayer: Layer
	public hiddenLayers: Layer[]
	public outputLayer: Layer
}

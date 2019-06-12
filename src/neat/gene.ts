import Brain from './brain'
import Layer from './layer'

export default class Gene {
	public inputLayer: Layer = new Layer()
	public hiddenLayer: Layer = new Layer()
	public outputLayer: Layer = new Layer()
}

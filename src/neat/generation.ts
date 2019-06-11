import { generateKeyPairSync } from 'crypto'
import Gene from './gene'

export default class Generation {
	public genes: Gene[]

	public forwardGeneration() {
		// ignore
	}

	public createGenes(quantity: number) {
		for (let i = 0; i < quantity; i++) {
			this.genes.push(new Gene())
		}
		return this.genes
	}
}

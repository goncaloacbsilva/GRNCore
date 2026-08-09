import { describe, expect, it } from 'vitest'
import {
    getModelSearchKeywords,
    modelMatchesSearchKeywords,
} from './model-filtering'

const sampleItem = {
    title: 'My pathway',
    filename: 'cell-cycle.sbml',
    description: 'A model for regulatory analysis',
    author: 'Ana Silva',
}

describe('models search helpers', () => {
    it('splits search queries into keywords', () => {
        expect(getModelSearchKeywords('  My   model  ')).toEqual([
            'my',
            'model',
        ])
    })

    it('matches every keyword across title, description, and author', () => {
        expect(modelMatchesSearchKeywords(sampleItem, ['my', 'model'])).toBe(
            true
        )
    })

    it('matches author names', () => {
        expect(modelMatchesSearchKeywords(sampleItem, ['silva'])).toBe(true)
    })

    it('matches filenames', () => {
        expect(modelMatchesSearchKeywords(sampleItem, ['cycle'])).toBe(true)
    })

    it('rejects items when a keyword is not present in any searchable field', () => {
        expect(modelMatchesSearchKeywords(sampleItem, ['my', 'unknown'])).toBe(
            false
        )
    })
})

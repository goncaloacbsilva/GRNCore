import { describe, expect, it } from 'vitest'
import {
    getModelDisplayTags,
    MODEL_METADATA_TAG_GROUPS,
    normalizeModelMetadataTags,
} from './model-metadata'

describe('normalizeModelMetadataTags', () => {
    it('keeps only the last source tag by default', () => {
        expect(
            normalizeModelMetadataTags(['SBML-qual', 'Annotated', 'GINML'])
        ).toEqual(['GINML', 'Annotated'])
    })

    it('prefers an explicitly selected source tag', () => {
        expect(
            normalizeModelMetadataTags(['SBML-qual', 'Annotated', 'GINML'], {
                preferredSourceTag: 'SBML-qual',
            })
        ).toEqual(['SBML-qual', 'Annotated'])
    })

    it('deduplicates additional tags while preserving them', () => {
        expect(
            normalizeModelMetadataTags(['Annotated', 'BNET', 'Annotated'])
        ).toEqual(['BNET', 'Annotated'])
    })
})

describe('community source display tags', () => {
    it('adds a BioModels display tag for community BioModels items', () => {
        expect(
            getModelDisplayTags({
                tags: ['SBML-qual'],
                source: 'biomodels',
            })
        ).toEqual(['SBML-qual', 'BioModels'])
    })

    it('adds a GINsim display tag for community GINsim items', () => {
        expect(
            getModelDisplayTags({
                tags: ['GINML'],
                source: 'ginsim',
            })
        ).toEqual(['GINML', 'GINsim'])
    })

    it('does not expose community source tags in editable metadata groups', () => {
        const editableTags = MODEL_METADATA_TAG_GROUPS.flatMap(
            (group) => group.items
        )

        expect(editableTags).not.toContain('BioModels')
        expect(editableTags).not.toContain('GINsim')
    })
})

import type { ModelMetadata } from '@/lib/schema'
import { ModelItem } from './model-item'

const MODELS_TEST_DATA: ModelMetadata[] = [
    {
        id: '1',
        title: 'p53-Mdm2',
        description:
            'A model that describes the regulatory interactions between the tumor suppressor protein p53, the ubiquitin ligase Mdm2 in its nuclear and cytoplasmic forms, and the DNA damage signal. And things like the cell cycle and apoptosis. This model is based on the work of Bar-Or et al. (2000) and was implemented in the BioNetGen language (BNGL). The model consists of a set of ordinary differential equations (ODEs) that describe the dynamics of the system over time. The model can be used to simulate the response of the p53-Mdm2 system to different types and levels of DNA damage, and to explore the effects of perturbations such as gene knockouts or drug treatments.',
        author: 'John Doe',
        tags: ['Annotated'],
    },
    {
        id: '1',
        title: 'p53-Mdm2',
        description:
            'A model that describes the regulatory interactions between the tumor suppressor protein p53, the ubiquitin ligase Mdm2 in its nuclear and cytoplasmic forms, and the DNA damage signal. And things like the cell cycle and apoptosis. This model is based on the work of Bar-Or et al. (2000) and was implemented in the BioNetGen language (BNGL). The model consists of a set of ordinary differential equations (ODEs) that describe the dynamics of the system over time. The model can be used to simulate the response of the p53-Mdm2 system to different types and levels of DNA damage, and to explore the effects of perturbations such as gene knockouts or drug treatments.',
        author: 'John Doe',
        tags: ['Annotated'],
    },
]

export function ModelsList() {
    return (
        <div className="flex flex-col gap-6 p-4">
            {MODELS_TEST_DATA.map((model) => (
                <ModelItem key={model.id} item={model} />
            ))}
        </div>
    )
}

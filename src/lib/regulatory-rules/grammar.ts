import * as ohm from 'ohm-js'
import regulatoryRuleGrammarSource from './regulatory-rule.ohm?raw'

export const regulatoryRuleGrammar = ohm.grammar(regulatoryRuleGrammarSource)

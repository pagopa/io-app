TS_DEFS = $(shell find ts-js -name *.d.ts)
FLOW_DEFS = $(TS_DEFS:%.d.ts=%.js.flow)

# Converts all TS type definitions in ts-js into Flow type definitions 
flow: $(FLOW_DEFS)

%.js.flow: %.d.ts
	./node_modules/.bin/flowgen -o $@ $<

.PHONY: flow

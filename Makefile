.PHONY: dist

all: dist

dist:
	rm -f CopyCID.zip
	zip CopyCID.zip --exclude Makefile --exclude 'resources/*' -r *

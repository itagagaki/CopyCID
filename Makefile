.PHONY: dist upload

all: dist

dist:
	rm -f CopyCID.zip
	zip CopyCID.zip --exclude Makefile --exclude icon128.pxz -r *

clean:
	rm -f CopyCID.zip

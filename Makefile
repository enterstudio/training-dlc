server:
	echo "Deleting old file."
	rm -f training-dlc.zip
	echo "Creating package."
	zip -r training-dlc.zip . -x "*.zip" "*.git*" "*.DS_Store*" "node_modules/*" "*.log*" "*.iml" ".idea/*" @

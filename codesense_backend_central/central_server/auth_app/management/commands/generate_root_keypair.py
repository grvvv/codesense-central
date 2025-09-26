# license/management/commands/generate_root_keypair.py
from django.core.management.base import BaseCommand
from licenses.services.crypto import generate_root_keypair

class Command(BaseCommand):
    help = "Generate the root keypair for licenses"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Generating root keypair..."))
        try:
            generate_root_keypair()
            self.stdout.write(self.style.SUCCESS("Root keypair generated successfully!"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error: {e}"))

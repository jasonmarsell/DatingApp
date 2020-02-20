using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.DTOs
{
    public class PhotoForCreationDto
    {
        public PhotoForCreationDto(string url, IFormFile file, string description, DateTime dateAdded, string publicId)
        {
            this.Url = url;
            this.File = file;
            this.Description = description;
            this.DateAdded = dateAdded;
            this.PublicId = publicId;

        }
        public string Url { get; set; }

        public IFormFile File { get; set; }

        public string Description { get; set; }

        public DateTime DateAdded { get; set; }

        public string PublicId { get; set; }

        public PhotoForCreationDto()
        {
            this.DateAdded = DateTime.Now;
        }
    }
}